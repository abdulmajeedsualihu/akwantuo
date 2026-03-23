-- Deleting orphaned storefront records that no longer have a corresponding profile.
-- This ensures the matching feature does not return "ghost" guides after a profile cleanup.
DELETE FROM public.storefronts
WHERE user_id NOT IN (SELECT user_id FROM public.profiles);

-- Adding a foreign key constraint to enforce this relationship in the future.
-- ON DELETE CASCADE ensures that deleting a profile automatically removes its storefront.
ALTER TABLE public.storefronts
ADD CONSTRAINT storefronts_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;
