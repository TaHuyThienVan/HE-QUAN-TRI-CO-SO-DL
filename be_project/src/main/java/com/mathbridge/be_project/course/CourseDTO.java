package com.mathbridge.be_project.course;

public class CourseDTO {
    private Long id;
    private String name;
    private Integer capacity;
    private Long registeredCount;

    public static CourseDTO fromEntity(Course c, long registered) {
        CourseDTO dto = new CourseDTO();
        dto.id = c.getId();
        dto.name = c.getName();
        dto.capacity = c.getCapacity();
        dto.registeredCount = registered;
        return dto;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Integer getCapacity() { return capacity; }
    public Long getRegisteredCount() { return registeredCount; }
}
