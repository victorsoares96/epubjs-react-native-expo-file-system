import { useCallback, useState } from 'react';
import * as ExpoFileSystem from 'expo-file-system';
import type { DownloadProgressData } from 'expo-file-system';
import type { FileInfo, FileSystem } from './types';

export function useFileSystem(): FileSystem {
  const [file, setFile] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [size, setSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const downloadFile = useCallback((fromUrl: string, toFile: string) => {
    const callback = (downloadProgress: DownloadProgressData) => {
      const currentProgress = Math.round(
        (downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite) *
          100
      );
      setProgress(currentProgress);
    };

    const downloadResumable = ExpoFileSystem.createDownloadResumable(
      fromUrl,
      ExpoFileSystem.documentDirectory + toFile,
      { cache: true },
      callback
    );

    setDownloading(true);
    return downloadResumable
      .downloadAsync()
      .then((value) => {
        if (!value) throw new Error('Download failed');

        if (value.headers['Content-Length']) {
          setSize(Number(value.headers['Content-Length']));
        }

        setSuccess(true);
        setError(null);
        setFile(value.uri);

        return { uri: value.uri, mimeType: value.mimeType };
      })
      .catch((err) => {
        if (err instanceof Error) {
          setError(err.message);
        } else setError('Error downloading file');

        return { uri: null, mimeType: null };
      })
      .finally(() => setDownloading(false));
  }, []);

  const getFileInfo = useCallback(async (fileUri: string) => {
    const {
      uri,
      exists,
      isDirectory,
      size: fileSize,
    } = (await ExpoFileSystem.getInfoAsync(fileUri)) as FileInfo;

    return {
      uri,
      exists,
      isDirectory,
      size: fileSize,
    };
  }, []);

  return {
    file,
    progress,
    downloading,
    size,
    error,
    success,
    documentDirectory: ExpoFileSystem.documentDirectory,
    cacheDirectory: ExpoFileSystem.cacheDirectory,
    bundleDirectory: ExpoFileSystem.bundleDirectory,
    readAsStringAsync: ExpoFileSystem.readAsStringAsync,
    writeAsStringAsync: ExpoFileSystem.writeAsStringAsync,
    deleteAsync: ExpoFileSystem.deleteAsync,
    downloadFile,
    getFileInfo,
  };
}
