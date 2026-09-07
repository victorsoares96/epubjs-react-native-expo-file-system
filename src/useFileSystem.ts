import { Directory, File, Paths } from 'expo-file-system';
import { useCallback, useState } from 'react';
import type { FileSystem } from './types';

function withTrailingSlash(uri: string): string {
  return uri.endsWith('/') ? uri : `${uri}/`;
}

function directoryUri(directory: Directory | null | undefined): string | null {
  if (!directory?.uri) {
    return null;
  }

  return withTrailingSlash(directory.uri);
}

export function useFileSystem(): FileSystem {
  const [file, setFile] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [size, setSize] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const downloadFile = useCallback((fromUrl: string, toFile: string) => {
    const destination = new File(Paths.document, toFile);

    setDownloading(true);
    setProgress(0);

    return File.downloadFileAsync(fromUrl, destination, {
      idempotent: true,
      onProgress: ({ bytesWritten, totalBytes }) => {
        if (totalBytes > 0) {
          setProgress(Math.round((bytesWritten / totalBytes) * 100));
        }
      },
    })
      .then((downloaded) => {
        setSize(downloaded.size);
        setSuccess(true);
        setError(null);
        setFile(downloaded.uri);
        setProgress(100);

        return {
          uri: downloaded.uri,
          mimeType: downloaded.type || null,
        };
      })
      .catch((err) => {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error downloading file');
        }

        setSuccess(false);
        setFile(null);
        setSize(0);

        return { uri: null, mimeType: null };
      })
      .finally(() => setDownloading(false));
  }, []);

  const getFileInfo = useCallback(async (fileUri: string) => {
    const directory = new Directory(fileUri);

    if (directory.exists) {
      return {
        uri: directory.uri,
        exists: true,
        isDirectory: true,
        size: directory.size ?? undefined,
      };
    }

    const target = new File(fileUri);

    return {
      uri: target.uri,
      exists: target.exists,
      isDirectory: false,
      size: target.exists ? target.size : undefined,
    };
  }, []);

  const readAsStringAsync = useCallback(
    async (
      fileUri: string,
      options?: {
        encoding?: 'utf8' | 'base64';
      }
    ) => {
      const target = new File(fileUri);

      if (options?.encoding === 'base64') {
        return target.base64();
      }

      return target.text();
    },
    []
  );

  const writeAsStringAsync = useCallback(
    async (
      fileUri: string,
      contents: string,
      options?: {
        encoding?: 'utf8' | 'base64';
      }
    ) => {
      const target = new File(fileUri);
      await target.write(contents, {
        encoding: options?.encoding ?? 'utf8',
      });
    },
    []
  );

  const deleteAsync = useCallback(async (fileUri: string) => {
    const target = new File(fileUri);

    if (target.exists) {
      target.delete();
      return;
    }

    const directory = new Directory(fileUri);

    if (directory.exists) {
      directory.delete();
    }
  }, []);

  return {
    file,
    progress,
    downloading,
    size,
    error,
    success,
    documentDirectory: directoryUri(Paths.document),
    cacheDirectory: directoryUri(Paths.cache),
    bundleDirectory: directoryUri(Paths.bundle) ?? undefined,
    readAsStringAsync,
    writeAsStringAsync,
    deleteAsync,
    downloadFile,
    getFileInfo,
  };
}
