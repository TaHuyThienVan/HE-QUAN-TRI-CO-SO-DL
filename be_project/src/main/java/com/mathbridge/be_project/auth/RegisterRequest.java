package com.mathbridge.be_project.auth;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.mathbridge.be_project.common.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(using = RegisterRequestDeserializer.class)
public class RegisterRequest {
    private String email;
    private String password;
    private UserRole role;
}
