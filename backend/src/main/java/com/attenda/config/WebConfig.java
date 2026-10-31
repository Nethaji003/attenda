package com.attenda.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String base = System.getProperty("user.dir");
        // Photos and document uploads both live under the upload root
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                    "file:" + base + "/uploads/",
                    "file:" + base + "/" + uploadDir + "/",
                    "file:" + base + "/uploads/photos/",
                    "file:" + base + "/uploads/docs/"
                );
    }
}
