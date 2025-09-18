    setError(null);

    if (response.id) {
      setSuccessMessage(
        'Document "${file.name}" uploaded successfully and analysis started.',
      );
      // Optionally trigger a refresh of the document list
      onUploadSuccess?.();
    } else {
      throw new Error("Upload failed: No document ID received");
    }
  } catch (__error) {
    setError(error.message || "Failed to upload document");
  } finally {
    setIsUploading(false);
  }
};
