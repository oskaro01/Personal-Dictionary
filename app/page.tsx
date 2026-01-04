import { DictionarySearch } from "@/components/dictionary-search"
import { AddWordDialog } from "@/components/add-word-dialog"
import { BookOpen } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Personal Dictionary</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Search your personal collection of words and definitions. Add new entries using JSON format.
          </p>
          <div className="pt-4">
            <AddWordDialog />
          </div>
        </header>

        <main>
          <DictionarySearch />
        </main>
      </div>
    </div>
  )
}
