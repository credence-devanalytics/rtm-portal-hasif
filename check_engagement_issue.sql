-- Check a sample of records to see likecount and diggcount values
SELECT 
    type as platform,
    channel,
    likecount,
    diggcount,
    commentcount,
    sharecount,
    interaction,
    totalreactionscount,
    reach,
    viewcount,
    followerscount,
    sourcereach,
    insertdate
FROM mentions_classify
WHERE insertdate >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY insertdate DESC
LIMIT 20;

-- Check aggregate engagement calculation
SELECT 
    type as platform,
    COUNT(*) as record_count,
    -- Current calculation for engagement (from rtm-metrics)
    SUM(CASE 
        WHEN interaction IS NOT NULL AND interaction > 0 
        THEN interaction
        ELSE COALESCE(likecount, 0) + COALESCE(commentcount, 0) + COALESCE(sharecount, 0)
    END) as total_engagements_current,
    -- Alternative calculation including diggcount
    SUM(CASE 
        WHEN interaction IS NOT NULL AND interaction > 0 
        THEN interaction
        ELSE COALESCE(likecount, 0) + COALESCE(diggcount, 0) + COALESCE(commentcount, 0) + COALESCE(sharecount, 0)
    END) as total_engagements_with_digg,
    -- Check if likecount now contains diggcount for TikTok
    SUM(CASE WHEN type = 'TikTok' THEN likecount ELSE 0 END) as tiktok_likecount_sum,
    SUM(CASE WHEN type = 'TikTok' THEN diggcount ELSE 0 END) as tiktok_diggcount_sum,
    -- Engagement rate calculation components
    SUM(COALESCE(
        interaction,
        totalreactionscount,
        (COALESCE(likecount,0) + COALESCE(commentcount,0) + COALESCE(sharecount,0)
          + COALESCE(playcount,0) + COALESCE(replycount,0) + COALESCE(retweetcount,0))
    )) as engagement_interactions_sum,
    SUM(COALESCE(
        NULLIF(reach, 0),
        NULLIF(viewcount, 0),
        NULLIF(followerscount, 0),
        NULLIF(sourcereach, 0)
    )) as engagement_reach_sum
FROM mentions_classify
WHERE insertdate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY type
ORDER BY record_count DESC;
