-- Phase 4: add a non-staff role before changing public user provisioning.
alter type public.profile_role add value if not exists 'member';
