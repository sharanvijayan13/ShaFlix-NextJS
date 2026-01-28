"use client";

import { useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ListsPage() {
  const { customLists, createList, updateList, deleteList } = useMovieContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    createList({
      name: formData.name,
      description: formData.description,
      movieIds: [],
      isPublic: formData.isPublic,
    });

    toast.success("List created!");
    setFormData({ name: "", description: "", isPublic: true });
    setShowCreateDialog(false);
  };

  const handleUpdate = () => {
    if (!editingList) return;

    updateList(editingList, {
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
    });

    toast.success("List updated!");
    setEditingList(null);
    setFormData({ name: "", description: "", isPublic: true });
  };

  const handleDelete = (listId: string) => {
    if (confirm("Are you sure you want to delete this list?")) {
      deleteList(listId);
      toast.success("List deleted");
    }
  };

  const openEditDialog = (listId: string) => {
    const list = customLists.find(l => l.id === listId);
    if (list) {
      setFormData({
        name: list.name,
        description: list.description,
        isPublic: list.isPublic,
      });
      setEditingList(listId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold">My Lists</h1>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create List
            </Button>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>

        {customLists.length === 0 ? (
          <Card className="bg-gray-800/50 border-gray-700 p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">No lists yet</h2>
            <p className="text-gray-400 mb-6">
              Create custom lists to organize your favorite movies
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First List
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customLists.map((list) => (
              <Card key={list.id} className="bg-gray-800/50 border-gray-700 p-6 hover:border-purple-500 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {list.isPublic ? (
                      <Globe className="w-4 h-4 text-green-400" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                    <h3 className="text-xl font-bold">{list.name}</h3>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(list.id)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(list.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-400 mb-4 line-clamp-2">{list.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {list.movieIds.length} movie{list.movieIds.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-gray-500">
                    {new Date(list.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <Link href={`/lists/${list.id}`}>
                  <Button variant="outline" className="w-full mt-4">
                    View List
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog
          open={showCreateDialog || editingList !== null}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreateDialog(false);
              setEditingList(null);
              setFormData({ name: "", description: "", isPublic: true });
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingList ? "Edit List" : "Create New List"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">List Name</label>
                <Input
                  placeholder="My Villain Era Movies"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  placeholder="Movies that make me feel powerful"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="public"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="public" className="text-sm">
                  Make this list public
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateDialog(false);
                    setEditingList(null);
                    setFormData({ name: "", description: "", isPublic: true });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={editingList ? handleUpdate : handleCreate}>
                  {editingList ? "Update" : "Create"} List
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
