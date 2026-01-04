"use client"

import { useState, useEffect } from "react"
import { Book, ChevronRight, Search, Settings } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { getAllWords } from "@/app/actions"
import { WordDetailModal } from "./word-detail-modal"

export function AppSidebar() {
  const [words, setWords] = useState<any[]>([])
  const [selectedWord, setSelectedWord] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    async function fetchWords() {
      const result = await getAllWords()
      if (result.data) {
        setWords(result.data)
      }
    }
    fetchWords()
  }, [])

  const handleWordClick = (word: any) => {
    setSelectedWord(word)
    setModalOpen(true)
  }

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-b px-4 py-2">
          <div className="flex items-center gap-2 font-semibold">
            <Book className="h-7 w-7 text-primary" />
            <span className="truncate group-data-[collapsible=icon]:hidden">Dictionary</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Home" isActive>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>All Words ({words.length})</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <div className="max-h-[60vh] overflow-y-auto px-2 py-1">
                  {words.map((word) => (
                    <SidebarMenuItem key={word.id}>
                      <SidebarMenuButton
                        className="w-full justify-between text-left"
                        onClick={() => handleWordClick(word)}
                      >
                        <span className="truncate capitalize">{word.word}</span>
                        <ChevronRight className="h-3 w-3 opacity-50" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {selectedWord && (
        <WordDetailModal
          word={selectedWord.word}
          definition={selectedWord.definition}
          createdAt={selectedWord.created_at}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  )
}
