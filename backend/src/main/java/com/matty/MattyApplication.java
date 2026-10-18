package com.matty;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class MattyApplication {

    private static final Logger log = LoggerFactory.getLogger(MattyApplication.class);

    public static void main(String[] args) {
        loadDotEnvIfPresent();
        SpringApplication.run(MattyApplication.class, args);
    }

    private static void loadDotEnvIfPresent() {
        String[] potentialPaths = {
            ".env",
            "backend/.env",
            "../.env",
            "../backend/.env"
        };

        for (String path : potentialPaths) {
            File envFile = new File(path);
            if (envFile.exists() && envFile.isFile()) {
                log.info("Loading environment variables from: {}", envFile.getAbsolutePath());
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIndex = line.indexOf('=');
                        if (eqIndex > 0) {
                            String key = line.substring(0, eqIndex).trim();
                            String value = line.substring(eqIndex + 1).trim();
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                if (value.length() >= 2) {
                                    value = value.substring(1, value.length() - 1);
                                }
                            }
                            if (System.getenv(key) == null && System.getProperty(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.warn("Could not read .env file at {}: {}", envFile.getAbsolutePath(), e.getMessage());
                }
                break;
            }
        }
    }
}
