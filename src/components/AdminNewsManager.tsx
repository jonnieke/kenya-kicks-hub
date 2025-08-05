import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  image_url: string | null;
  author_id: string;
  published_at: string | null;
  is_published: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  category: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

const AdminNewsManager = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image_url: "",
    category: "General",
    tags: "",
    is_published: false
  });

  const categories = ["General", "CAF CHAN", "African Cup", "Transfer News", "Match Analysis", "Player Spotlight"];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const articleData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        image_url: formData.image_url || null,
        category: formData.category,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
        is_published: formData.is_published,
        author_id: user.id,
        published_at: formData.is_published ? new Date().toISOString() : null
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Article updated successfully"
        });
        setIsEditDialogOpen(false);
      } else {
        const { error } = await supabase
          .from('news_articles')
          .insert([articleData]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Article created successfully"
        });
        setIsCreateDialogOpen(false);
      }

      setFormData({
        title: "",
        content: "",
        excerpt: "",
        image_url: "",
        category: "General",
        tags: "",
        is_published: false
      });
      setEditingArticle(null);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt || "",
      image_url: article.image_url || "",
      category: article.category,
      tags: article.tags?.join(', ') || "",
      is_published: article.is_published
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Article deleted successfully"
      });
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive"
      });
    }
  };

  const togglePublished = async (article: NewsArticle) => {
    try {
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          is_published: !article.is_published,
          published_at: !article.is_published ? new Date().toISOString() : null
        })
        .eq('id', article.id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Article ${!article.is_published ? 'published' : 'unpublished'} successfully`
      });
      fetchArticles();
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        title: "Error",
        description: "Failed to update article",
        variant: "destructive"
      });
    }
  };

  const ArticleForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={formData.excerpt}
          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={8}
          required
        />
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="football, transfer, analysis"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_published"
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
        />
        <Label htmlFor="is_published">Publish immediately</Label>
      </div>

      <Button type="submit" className="w-full">
        {editingArticle ? 'Update Article' : 'Create Article'}
      </Button>
    </form>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading articles...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>News Articles Management</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
              </DialogHeader>
              <ArticleForm />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {article.excerpt || article.content.substring(0, 150) + '...'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {article.view_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(article.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={article.is_published ? "default" : "secondary"}>
                      {article.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline">{article.category}</Badge>
                    {article.tags?.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublished(article)}
                  >
                    {article.is_published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(article)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {articles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No articles found. Create your first article!
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          <ArticleForm />
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminNewsManager;