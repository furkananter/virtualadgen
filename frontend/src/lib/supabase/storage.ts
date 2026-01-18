import { supabase } from '@/config/supabase';

const IMAGE_INPUT_BUCKET = 'image-inputs';
const SIGNED_URL_TTL = 60 * 60 * 24 * 365; // 365 days

const buildFilePath = (userId: string, file: File): string => {
  const hasDot = file.name.lastIndexOf('.') !== -1;
  const ext = hasDot
    ? file.name.split('.').pop()
    : file.type.split('/')[1] || 'png';
  // Path format: {user_id}/{uuid}.ext for RLS policy
  return `${userId}/${crypto.randomUUID()}.${(ext || 'png').toLowerCase()}`;
};

export const uploadImageInput = async (file: File): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const filePath = buildFilePath(user.id, file);
  const bucket = supabase.storage.from(IMAGE_INPUT_BUCKET);

  const { error: uploadError } = await bucket.upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  });

  if (uploadError) {
    throw new Error(uploadError.message || 'Failed to upload image');
  }

  const { data, error: signError } = await bucket.createSignedUrl(
    filePath,
    SIGNED_URL_TTL,
  );

  if (signError || !data?.signedUrl) {
    throw new Error(signError?.message || 'Failed to create signed URL');
  }

  return data.signedUrl;
};
