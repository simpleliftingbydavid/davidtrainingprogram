import { t } from './i18n.js';
export async function deleteStoragePaths(paths = [], deletePath) {
  const uniquePaths = [...new Set((paths || []).map((path) => String(path || '').trim()).filter(Boolean))];
  const failures = [];
  for (const path of uniquePaths) {
    try {
      await deletePath(path);
    } catch (error) {
      if (String(error?.code || '').toLowerCase() === 'storage/object-not-found') continue;
      failures.push({ path, error });
    }
  }
  if (failures.length) {
    const error = new Error(`${t('td.khong_the_xoa_anh_khoi_storage', { p0: failures.length, p1: uniquePaths.length })}`);
    error.code = 'storage-delete-incomplete';
    error.failures = failures;
    throw error;
  }
  return { deletedCount: uniquePaths.length };
}
