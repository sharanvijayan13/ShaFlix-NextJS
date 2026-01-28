"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMovieContext } from "../contexts/MovieContext";
import { toast } from "sonner";
import { Plus, List } from "lucide-react";

interface ListManagerProps {
  movieId?: number;
}

export default function ListManager({ movieId }: ListManagerProps) {
  const { customLists, createList, addMovieToList, removeMovieFromList } = useMovieContext();
  const [open, setOpen] = useState(false);
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handleCreateList = () => {
    if (!newListName.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    createList({
      name: newListName,
      description: newListDescription,
      movieIds: movieId ? [movieId] : [],
      isPublic,
    });

    toast.success("List created!");
    setNewListName("");
    setNewListDescription("");
    setShowCreateNew(false);
    if (movieId) setOpen(false);
  };

  const handleToggleMovie = (listId: string, isInList: boolean) => {
    if (!movieId) return;

    if (isInList) {
      removeMovieFromList(listId, movieId);
      toast.success("Removed from list");
    } else {
      addMovieToList(listId, movieId);
      toast.success("Added to list");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <List className="w-4 h-4 mr-2" />
          Add to List
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>

        {!showCreateNew ? (
          <div className="space-y-3">
            {customLists.map((list) => {
              const isInList = movieId ? list.movieIds.includes(movieId) : false;
              return (
                <div
                  key={list.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div>
                    <p className="font-medium">{list.name}</p>
                    <p className="text-sm text-gray-500">{list.movieIds.length} movies</p>
                  </div>
                  <Button
                    size="sm"
                    variant={isInList ? "secondary" : "default"}
                    onClick={() => handleToggleMovie(list.id, isInList)}
                  >
                    {isInList ? "Remove" : "Add"}
                  </Button>
                </div>
              );
            })}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowCreateNew(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New List
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">List Name</label>
              <Input
                placeholder="My Villain Era Movies"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Movies that make me feel powerful"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="public"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="public" className="text-sm">
                Make this list public
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateList} className="flex-1">
                Create List
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateNew(false)}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
