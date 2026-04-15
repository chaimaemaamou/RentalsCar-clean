package com.example.amc.controller;

import com.example.amc.dto.file.FileUploadResponseDto;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/files")
public class FileController {

    private final Path uploadPath;

    public FileController(@Value("${app.media.upload-dir:uploads/media}") String uploadDir) throws IOException {
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(this.uploadPath);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MANAGER')")
    public List<FileUploadResponseDto> upload(@RequestParam("files") List<MultipartFile> files) throws IOException {
        return files.stream()
                .filter(file -> !file.isEmpty())
                .map(this::storeFile)
                .toList();
    }

    private FileUploadResponseDto storeFile(MultipartFile file) {
        String originalName = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
        String extension = "";
        int dotIndex = originalName.lastIndexOf('.');
        if (dotIndex >= 0) {
            extension = originalName.substring(dotIndex);
        }
        String fileName = UUID.randomUUID() + extension;
        try {
            Path targetLocation = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return relative URL so frontend can use correct base URL
            String url = "/media/" + fileName;
            return new FileUploadResponseDto(fileName, url);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file " + originalName, e);
        }
    }
}

