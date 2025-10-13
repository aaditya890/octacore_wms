import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Get an item from localStorage
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.error("[v0] Error reading from localStorage:", error)
      return null
    }
  }

  /**
   * Set an item in localStorage
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.error("[v0] Error writing to localStorage:", error)
    }
  }

  /**
   * Remove an item from localStorage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error("[v0] Error removing from localStorage:", error)
    }
  }

  /**
   * Clear all items from localStorage
   */
  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error("[v0] Error clearing localStorage:", error)
    }
  }

  /**
   * Get an object from localStorage (parses JSON)
   */
  getObject<T>(key: string): T | null {
    const item = this.getItem(key)
    if (!item) return null

    try {
      return JSON.parse(item) as T
    } catch (error) {
      console.error("[v0] Error parsing JSON from localStorage:", error)
      return null
    }
  }

  /**
   * Set an object in localStorage (stringifies JSON)
   */
  setObject<T>(key: string, value: T): void {
    try {
      const jsonString = JSON.stringify(value)
      this.setItem(key, jsonString)
    } catch (error) {
      console.error("[v0] Error stringifying object for localStorage:", error)
    }
  }
}
