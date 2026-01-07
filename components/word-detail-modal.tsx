"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

type WordDetailModalProps = {
  word: string
  definition: string
  createdAt: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WordDetailModal({ word, definition, createdAt, open, onOpenChange }: WordDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[75%] sm:w-full aspect-square flex flex-col mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl capitalize">{word}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col justify-between py-4 px-2 sm:px-0">
          <div className="space-y-4">
            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">{definition}</p>
          </div>
          <div className="flex justify-end">
            <Badge variant="secondary">Added {new Date(createdAt).toLocaleDateString()}</Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
