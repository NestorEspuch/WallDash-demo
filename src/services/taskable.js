import { supabase } from './supabase'

export function createTaskableService(table, fieldName, doneField, doneAtField) {
  return {
    async fetchPending() {
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq(doneField, false)
        .order('created_at', { ascending: false })
      return data || []
    },

    async fetchDone() {
      const { data } = await supabase
        .from(table)
        .select('*')
        .eq(doneField, true)
        .order(doneAtField, { ascending: false })
      return data || []
    },

    async create(values) {
      const { data, error } = await supabase
        .from(table)
        .insert(values)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async update(id, updates) {
      const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    async delete(id) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      if (error) throw error
    },
  }
}

export const taskService = createTaskableService('tasks', 'title', 'is_done', 'done_at')
export const shoppingService = createTaskableService('shopping_items', 'name', 'is_bought', 'bought_at')
