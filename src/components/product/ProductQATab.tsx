import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface QA {
  _id: string;
  question: string;
  userName: string;
  isAnswered: boolean;
  answer?: string;
}

interface ProductQATabProps {
  questions?: QA[];
  isAuthenticated: boolean;
  onAskQuestion: (question: string) => void;
}

export function ProductQATab({
  questions,
  isAuthenticated,
  onAskQuestion,
}: ProductQATabProps) {
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState("");

  const handleSubmit = () => {
    onAskQuestion(questionText);
    setShowQuestionForm(false);
    setQuestionText("");
  };

  return (
    <div className="space-y-4 mt-4">
      {!showQuestionForm && isAuthenticated && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowQuestionForm(true)}
        >
          Ask a Question
        </Button>
      )}

      {showQuestionForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>Your Question</Label>
              <Textarea
                placeholder="Ask anything about this product..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                Post Question
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowQuestionForm(false);
                  setQuestionText("");
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map((qa) => (
            <Card key={qa._id}>
              <CardContent className="p-4">
                <div className="mb-2">
                  <div className="font-semibold text-sm">Q: {qa.question}</div>
                  <div className="text-xs text-muted-foreground">by {qa.userName}</div>
                </div>
                {qa.isAnswered && qa.answer && (
                  <div className="mt-3 pl-4 border-l-2 border-primary">
                    <div className="font-semibold text-sm text-primary">
                      A: {qa.answer}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No questions yet. Be the first to ask!
          </p>
        )}
      </div>
    </div>
  );
}
