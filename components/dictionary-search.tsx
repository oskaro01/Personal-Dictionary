"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search } from "lucide-react"
import { searchWords, getWordsByIds } from "@/app/actions"
import { Badge } from "@/components/ui/badge"
import { WordDetailModal } from "./word-detail-modal"
import { Button } from "@/components/ui/button"

type DictionaryEntry = {
  id: string
  word: string
  definition: string
  created_at: string
}

const SEARCH_HISTORY_KEY = "dictionary_search_history"
const MAX_HISTORY = 7

function getSearchHistory(): string[] {
  if (typeof window === "undefined") return []
  const history = localStorage.getItem(SEARCH_HISTORY_KEY)
  return history ? JSON.parse(history) : []
}

function addToSearchHistory(wordId: string) {
  if (typeof window === "undefined") return
  let history = getSearchHistory()
  // Remove if already exists
  history = history.filter((id) => id !== wordId)
  // Add to front
  history.unshift(wordId)
  // Keep only last 7
  history = history.slice(0, MAX_HISTORY)
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history))
}

export function DictionarySearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<DictionaryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedWord, setSelectedWord] = useState<DictionaryEntry | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const loadSearchHistory = async () => {
    setLoading(true)
    const historyIds = getSearchHistory()
    if (historyIds.length > 0) {
      const result = await getWordsByIds(historyIds)
      // Sort by history order
      const sorted = historyIds
        .map((id) => result.data?.find((w) => w.id === id))
        .filter((w): w is DictionaryEntry => w !== undefined)
      setResults(sorted)
    } else {
      setResults([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadSearchHistory()
  }, [])

  useEffect(() => {
    if (!modalOpen && query.trim() === "") {
      loadSearchHistory()
    }
  }, [modalOpen, query])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim() === "") {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      const result = await searchWords(query)
      setSuggestions(result.data || [])
      setShowSuggestions(true)
    }

    const debounce = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(debounce)
  }, [query])

  const handleSearch = async () => {
    if (query.trim() === "") {
      await loadSearchHistory()
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    const result = await searchWords(query)

    if (result.data && result.data.length === 1) {
      addToSearchHistory(result.data[0].id)
      setSelectedWord(result.data[0])
      setModalOpen(true)
      setResults([])
    } else {
      setResults(result.data || [])
    }
    setLoading(false)
    setShowSuggestions(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleWordClick = (entry: DictionaryEntry) => {
    addToSearchHistory(entry.id)
    setSelectedWord(entry)
    setModalOpen(true)
  }

  const handleSuggestionClick = (entry: DictionaryEntry) => {
    setQuery(entry.word)
    setShowSuggestions(false)
    addToSearchHistory(entry.id)
    setSelectedWord(entry)
    setModalOpen(true)
  }

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    if (value.trim() === "") {
      await loadSearchHistory()
    }
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for a word..."
            value={query}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={() => query.trim() !== "" && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 h-12 text-lg"
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <Card className="absolute top-full mt-1 w-full z-50 max-h-64 overflow-y-auto">
              {suggestions.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                  onClick={() => handleSuggestionClick(entry)}
                >
                  <p className="font-medium capitalize">{entry.word}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">{entry.definition}</p>
                </div>
              ))}
            </Card>
          )}
        </div>
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="h-12 px-6 bg-[#fae54d] hover:bg-[#e6d645] text-black font-medium"
        >
          Search
        </Button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Searching...</p>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {query.trim() === ""
                  ? "Recently searched words"
                  : `${results.length} ${results.length === 1 ? "word" : "words"} found`}
              </p>
            </div>
            {results.map((entry) => (
              <Card
                key={entry.id}
                className="p-5 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleWordClick(entry)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold capitalize">{entry.word}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{entry.definition}</p>
                </div>
              </Card>
            ))}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{query.trim() === "" ? "No search history yet" : "No words found"}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {query.trim() === "" ? "Search for a word to get started" : "Try a different search or add a new word"}
            </p>
          </div>
        )}
      </div>

      {selectedWord && (
        <WordDetailModal
          word={selectedWord.word}
          definition={selectedWord.definition}
          createdAt={selectedWord.created_at}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </div>
  )
}
