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
    const error = new Error(`Không thể xóa ${failures.length}/${uniquePaths.length} ảnh khỏi Storage.`);
    error.code = 'storage-delete-incomplete';
    error.failures = failures;
    throw error;
  }
  return { deletedCount: uniquePaths.length };
}
