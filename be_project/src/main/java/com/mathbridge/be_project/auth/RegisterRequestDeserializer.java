package com.mathbridge.be_project.auth;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.mathbridge.be_project.common.UserRole;

import java.io.IOException;

public class RegisterRequestDeserializer extends JsonDeserializer<RegisterRequest> {
    @Override
    public RegisterRequest deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        RegisterRequest request = new RegisterRequest();
        
        if (node.has("email")) {
            request.setEmail(node.get("email").asText());
        }
        
        if (node.has("password")) {
            request.setPassword(node.get("password").asText());
        }
        
        if (node.has("role")) {
            String roleString = node.get("role").asText();
            // Map "TEACHER" from frontend to "TUTOR" in backend
            if (roleString != null && !roleString.isEmpty()) {
                if (roleString.equalsIgnoreCase("TEACHER")) {
                    request.setRole(UserRole.TUTOR);
                } else {
                    try {
                        request.setRole(UserRole.valueOf(roleString.toUpperCase()));
                    } catch (IllegalArgumentException e) {
                        try {
                            request.setRole(UserRole.fromValue(roleString.toLowerCase()));
                        } catch (IllegalArgumentException ex) {
                            request.setRole(UserRole.STUDENT); // Default
                        }
                    }
                }
            }
        }
        
        return request;
    }
}

