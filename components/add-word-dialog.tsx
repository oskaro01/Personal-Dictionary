"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { addWords } from "@/lib/addWords"
import { useToast } from "@/hooks/use-toast"

import { useAdminKey } from "./adminKeyContext"



export function AddWordDialog() {
  const [open, setOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const { adminKey } = useAdminKey() // grab key from context

  const handleSubmit = async () => {
    try {
      if (!adminKey) {
        toast({
          title: "Admin key required",
          description: "Please set the admin key from the sidebar first",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      const parsed = JSON.parse(jsonInput)

      let wordsArray: { word: string; definition: string }[]

      if (Array.isArray(parsed)) {
        wordsArray = parsed
      } else if (parsed.word && parsed.definition) {
        wordsArray = [parsed]
      } else {
        toast({
          title: "Invalid JSON",
          description: 'JSON must be an array or object with "word" and "definition" fields',
          variant: "destructive",
        })
        return
      }

      const isValid = wordsArray.every((w) => w.word && w.definition)
      if (!isValid) {
        toast({
          title: "Invalid JSON",
          description: 'All entries must contain "word" and "definition" fields',
          variant: "destructive",
        })
        return
      }

      const res = await fetch("/api/words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": adminKey, // or input your key securely
        },
        body: JSON.stringify(wordsArray),
        })

      const result = await res.json()


      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

    const count = result.inserted

    if (count === 0) {
      toast({
        title: "No new words added",
        description: "All provided words already exist in your dictionary",
      })
    } else {
      toast({
        title: "Success",
        description: `Added ${count} ${count === 1 ? "word" : "words"} to dictionary`,
      })
    }

    setJsonInput("")
    setOpen(false)

    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please enter valid JSON format",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-[#fae54d] hover:bg-[#e6d645] text-black">
          <Plus className="h-5 w-5" />
          Add Word
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Word(s)</DialogTitle>
          <DialogDescription>
            Enter a JSON object or array of objects with "word" and "definition" fields
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="json-input">JSON Input</Label>
            <Textarea
              id="json-input"
              placeholder='[{"word": "example", "definition": "a thing characteristic of its kind"}]'
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[160px] max-h-[300px] overflow-y-auto font-mono text-sm"
            />
          </div>
          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground space-y-2">
            <div>
              <p className="font-semibold mb-1">Single word:</p>
              <code className="text-xs block">
                {JSON.stringify({ word: "ephemeral", definition: "Lasting for a very short time" })}
              </code>
            </div>
            <div>
              <p className="font-semibold mb-1">Multiple words:</p>
              <code className="text-xs block whitespace-pre">
                {JSON.stringify(
                  [
                    { word: "ephemeral", definition: "Lasting for a very short time" },
                    { word: "eloquent", definition: "Fluent or persuasive in speaking" },
                  ],
                  null,
                  2,
                )}
              </code>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#fae54d] hover:bg-[#e6d645] text-black">
            {loading ? "Adding..." : "Add Word(s)"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
