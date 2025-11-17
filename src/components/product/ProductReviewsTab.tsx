import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  isVerified: boolean;
}

interface ProductReviewsTabProps {
  reviews?: Review[];
  averageRating?: { average: number; count: number };
  isAuthenticated: boolean;
  onSubmitReview: (rating: number, comment: string) => void;
}

export function ProductReviewsTab({
  reviews,
  averageRating,
  isAuthenticated,
  onSubmitReview,
}: ProductReviewsTabProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const handleSubmit = () => {
    onSubmitReview(reviewRating, reviewComment);
    setShowReviewForm(false);
    setReviewComment("");
    setReviewRating(5);
  };

  return (
    <div className="space-y-4 mt-4">
      {averageRating && (
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="text-center">
            <div className="text-3xl font-bold">{averageRating.average.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(averageRating.average)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {averageRating.count} reviews
            </div>
          </div>
        </div>
      )}

      {!showReviewForm && isAuthenticated && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowReviewForm(true)}
        >
          Write a Review
        </Button>
      )}

      {showReviewForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    size="sm"
                    variant={reviewRating >= rating ? "default" : "outline"}
                    onClick={() => setReviewRating(rating)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Your Review</Label>
              <Textarea
                placeholder="Share your experience with this product..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                Submit Review
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewComment("");
                  setReviewRating(5);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {reviews && reviews.length > 0 ? (
          reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold">{review.userName}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      Verified Purchase
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No reviews yet. Be the first to review!
          </p>
        )}
      </div>
    </div>
  );
}
