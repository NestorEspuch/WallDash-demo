import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!BOT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing required environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  const secret = req.headers.get('X-Telegram-Bot-Api-Secret-Token')
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  let update
  try {
    update = await req.json()
  } catch {
    return new Response('Bad Request', { status: 400 })
  }

  const message = update?.message || update?.edited_message
  if (!message || !message.text || !message.chat || !message.from) {
    return new Response('OK')
  }

  const telegramUserId = message.from.id
  const chatId = message.chat.id
  const command = message.text.trim().split('@')[0]

  const { data: allowed } = await supabase
    .from('telegram_allowed_users')
    .select('telegram_user_id')
    .eq('telegram_user_id', telegramUserId)
    .maybeSingle()

  if (!allowed) {
    await sendMessage(chatId, 'No estás autorizado para usar este bot.')
    return new Response('OK')
  }

  try {
    if (command === '/lista') {
      const { data: items } = await supabase
        .from('shopping_items')
        .select('name')
        .eq('is_bought', false)
        .order('created_at', { ascending: false })

      await sendMessage(chatId, formatShoppingList(items || []))
      return new Response('OK')
    }

    if (command === '/tareas') {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('title')
        .eq('is_done', false)
        .order('created_at', { ascending: false })

      await sendMessage(chatId, formatTaskList(tasks || []))
      return new Response('OK')
    }

    await sendMessage(chatId, 'Comandos disponibles:\n/lista\n/tareas')
    return new Response('OK')
  } catch {
    return new Response('OK')
  }
})

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  })
}

function formatShoppingList(items: { name: string }[]) {
  if (items.length === 0) {
    return 'Lista de la compra\n\nNo hay artículos pendientes.'
  }

  const list = items.map((item) => `• ${item.name}`).join('\n')
  const total = `${items.length} artículo${items.length === 1 ? '' : 's'} pendiente${items.length === 1 ? '' : 's'}`
  return `Lista de la compra\n\n${list}\n\n${total}`
}

function formatTaskList(tasks: { title: string }[]) {
  if (tasks.length === 0) {
    return 'Tareas pendientes\n\nNo hay tareas pendientes.'
  }

  const list = tasks.map((task) => `• ${task.title}`).join('\n')
  const total = `${tasks.length} tarea${tasks.length === 1 ? '' : 's'} pendiente${tasks.length === 1 ? '' : 's'}`
  return `Tareas pendientes\n\n${list}\n\n${total}`
}
