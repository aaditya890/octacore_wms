  import { Injectable } from '@angular/core';
  import { environment } from '../../../environments/environment';
  import { createClient, SupabaseClient } from '@supabase/supabase-js';

  @Injectable({
    providedIn: 'root'
  })
  export class SupabaseService {
    private supabase: SupabaseClient
    
    constructor() {
      this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    }

 
  get client() {
    return this.supabase;
  }

    // Auth Methods
    async signInWithPassword(email: string, password: string) {
      return await this.supabase.auth.signInWithPassword({
        email,
        password,
      })
    }

    async signUp(email: string, password: string, metadata?: any) {
      return await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
    }

    async resetPasswordForEmail(email: string) {
      return await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
    }

    async signOut() {
      return await this.supabase.auth.signOut()
    }

    async getSession() {
      return await this.supabase.auth.getSession()
    }

    async getUser() {
      return await this.supabase.auth.getUser()
    }

    // Generic CRUD Methods
    from(table: string) {
      return this.supabase.from(table)
    }

    // Inventory Methods
    async getInventory() {
      return await this.supabase.from("inventory_items").select("*").order("itemName", { ascending: true })
    }

    async getInventoryById(id: string) {
      return await this.supabase.from("inventory_items").select("*").eq("id", id).single()
    }

    async addInventory(item: any) {
      return await this.supabase.from("inventory_items").insert(item).select().single()
    }

    async updateInventory(id: string, data: any) {
      return await this.supabase.from("inventory_items").update(data).eq("id", id).select().single()
    }

    async deleteInventory(id: string) {
      return await this.supabase.from("inventory_items").delete().eq("id", id)
    }

    // Gate Pass Methods
    async getGatePasses() {
      return await this.supabase.from("gate_passes").select("*").order("date", { ascending: false })
    }

    async addGatePass(gatePass: any) {
      return await this.supabase.from("gate_passes").insert(gatePass).select().single()
    }

    async updateGatePass(id: string, data: any) {
      return await this.supabase.from("gate_passes").update(data).eq("id", id).select().single()
    }

    // Purchase Indents Methods
    async getIndents() {
      return await this.supabase.from("purchase_indents").select("*").order("requestDate", { ascending: false })
    }

    async addIndent(indent: any) {
      return await this.supabase.from("purchase_indents").insert(indent).select().single()
    }

    async updateIndent(id: string, data: any) {
      return await this.supabase.from("purchase_indents").update(data).eq("id", id).select().single()
    }

    // Transactions (Inwards/Outwards) Methods
    async getTransactions() {
      return await this.supabase.from("transactions").select("*").order("date", { ascending: false })
    }

    async addTransaction(transaction: any) {
      return await this.supabase.from("transactions").insert(transaction).select().single()
    }

    // Users Methods
    async getUsers() {
      return await this.supabase.from("users").select("*").order("full_name", { ascending: true })
    }

    async getUserById(id: string) {
      return await this.supabase.from("users").select("*").eq("id", id).single()
    }

    async updateUser(id: string, data: any) {
      return await this.supabase.from("users").update(data).eq("id", id).select().single()
    }

    // Reports Methods
    async getReports() {
      return await this.supabase.from("reports").select("*").order("createdAt", { ascending: false })
    }

    // Settings Methods
    async getSettings() {
      return await this.supabase.from("settings").select("*").single()
    }

    async updateSettings(data: any) {
      return await this.supabase.from("settings").upsert(data).select().single()
    }
  }
