CREATE OR REPLACE FUNCTION set_favorite_with_limit(
    prompt_id UUID,
    user_uuid UUID
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_favorite_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_favorite_count
    FROM prompts
    WHERE user_id = user_uuid AND favorit = TRUE;

    IF v_favorite_count >= 25 THEN
        RETURN 'limit_reached';
    END IF;

    UPDATE prompts
    SET sort_order = sort_order + 1000
    WHERE user_id = user_uuid;

    UPDATE prompts 
    SET favorit = TRUE, sort_order = 1
    WHERE id = prompt_id AND user_id = user_uuid;

    WITH reordered AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC) AS new_order
        FROM prompts
        WHERE user_id = user_uuid
        ORDER BY sort_order ASC
    )
    UPDATE prompts
    SET sort_order = reordered.new_order
    FROM reordered
    WHERE prompts.id = reordered.id;

    RETURN 'success';
END;
$$;