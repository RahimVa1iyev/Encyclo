"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MessageSquarePlus } from "lucide-react";

interface NewPostFormProps {
  productId: string;
  user: any;
}

export default function NewPostForm({ productId, user }: NewPostFormProps) {
  const [newPost, setNewPost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!newPost.trim() || newPost.length < 10) {
      toast.error("Şərh ən azı 10 simvoldan ibarət olmalıdır");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("forum_posts").insert({
        product_id: productId,
        user_id: user.id,
        content: newPost.trim(),
      });

      if (error) throw error;

      setNewPost("");
      toast.success("Şərhiniz əlavə edildi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Xəta baş verdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center space-y-4">
        <p className="text-slate-600 font-medium">Şərh yazmaq üçün daxil olun</p>
        <Button 
          onClick={() => router.push("/login")}
          className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700"
        >
          Daxil ol
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 text-slate-900 font-bold">
        <MessageSquarePlus className="w-5 h-5 text-indigo-600" />
        Müzakirəyə qoşulun
      </div>
      <Textarea
        placeholder="Bu məhsul haqqında fikirlərinizi bölüşün..."
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        className="min-h-[120px] rounded-2xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all resize-none"
      />
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Minimum 10 simvol
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || newPost.length < 10}
          className="rounded-xl px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Göndərilir...
            </>
          ) : (
            "Paylaş"
          )}
        </Button>
      </div>
    </div>
  );
}
