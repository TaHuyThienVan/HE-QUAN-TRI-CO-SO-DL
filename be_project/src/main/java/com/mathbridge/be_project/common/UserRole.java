package com.mathbridge.be_project.common;

public enum UserRole {
    ADMIN("admin"),
    TUTOR("tutor"),
    STUDENT("student"),
    PARENT("parent"),
    FINANCE("finance");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static UserRole fromValue(String value) {
        for (UserRole role : UserRole.values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }
}
