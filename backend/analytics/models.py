from django.db import models

# Raw social posts (before cleaning)
class PostRaw(models.Model):
    platform = models.CharField(max_length=50)   # e.g., Twitter, Instagram
    post_id = models.CharField(max_length=100, unique=True)
    content = models.TextField()
    created_at = models.DateTimeField()
    fetched_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.platform} - {self.post_id}"


# Cleaned/processed posts
class PostClean(models.Model):
    raw_post = models.OneToOneField(PostRaw, on_delete=models.CASCADE, related_name="cleaned")
    clean_content = models.TextField()
    sentiment = models.CharField(max_length=20)  # Positive, Negative, Neutral
    topics = models.TextField(null=True, blank=True)  # comma-separated topics
    poi = models.ForeignKey("POI", null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Cleaned: {self.raw_post.post_id}"


# Points of Interest (attractions, hotels, landmarks)
class POI(models.Model):
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)  # e.g., Beach, Museum
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name


# Sentiment / Topic trends
class SentimentTopic(models.Model):
    topic = models.CharField(max_length=100)
    sentiment = models.CharField(max_length=20)
    count = models.IntegerField(default=0)
    date = models.DateField()

    def __str__(self):
        return f"{self.topic} ({self.sentiment}) on {self.date}"
