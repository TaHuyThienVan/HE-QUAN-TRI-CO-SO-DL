package com.mathbridge.be_project.auth;

import com.mathbridge.be_project.security.JwtUtils;
import com.mathbridge.be_project.student.Student;
import com.mathbridge.be_project.student.StudentRepository;
import com.mathbridge.be_project.tutor.Tutor;
import com.mathbridge.be_project.tutor.TutorRepository;
import com.mathbridge.be_project.user.*;
import com.mathbridge.be_project.common.UserStatus;
import com.mathbridge.be_project.common.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final TutorRepository tutorRepository;
    private final StudentRepository studentRepository;

    public AuthResponse login(LoginRequest request) {
        try {
            // Xác thực user
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userService.getUserByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
            
            String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());
            
            // Tạo UserDTO với thông tin user
            AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO(
                    user.getId(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole().name()
            );
            
            // Tạo AuthResponse với đầy đủ thông tin
            AuthResponse response = new AuthResponse();
            response.setOk(true);
            response.setMessage("Đăng nhập thành công");
            response.setToken(token);
            response.setUser(userDTO);
            
            return response;
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng", e);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi đăng nhập: " + e.getMessage(), e);
        }
    }

    public AuthResponse register(RegisterRequest request) {
        // Create user using available constructor on User
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        // Set default role to STUDENT if not provided
        // Note: RegisterRequestDeserializer already maps "TEACHER" to TUTOR
        UserRole role = request.getRole() != null ? request.getRole() : UserRole.STUDENT;
        
        User user = new User(
                "User", // Default fullName - can be updated later
                request.getEmail(),
                encodedPassword,
                null, // phone
                role
        );
        user.setStatus(UserStatus.ACTIVE);

        User savedUser = userService.createUser(user);
        
        // Nếu là giảng viên (TUTOR), tự động tạo Tutor record với employeeId
        if (savedUser.getRole() == UserRole.TUTOR) {
            Tutor tutor = new Tutor();
            tutor.setUser(savedUser);
            // Generate employeeId: GV + 6 random digits
            String employeeId = "GV" + String.format("%06d", (int)(Math.random() * 900000) + 100000);
            tutor.setEmployeeId(employeeId);
            tutorRepository.save(tutor);
        }
        
        // Nếu là học sinh (STUDENT), tự động tạo Student record
        if (savedUser.getRole() == UserRole.STUDENT) {
            // Kiểm tra xem đã có Student record chưa
            if (studentRepository.findByUser(savedUser).isEmpty()) {
                Student student = new Student();
                student.setUser(savedUser);
                student.setFullName(savedUser.getFullName() != null && !savedUser.getFullName().isEmpty() 
                        ? savedUser.getFullName() : "Học sinh");
                student.setEmail(savedUser.getEmail());
                studentRepository.save(student);
            }
        }
        
        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole().name());
        
        // Tạo UserDTO với thông tin user
        AuthResponse.UserDTO userDTO = new AuthResponse.UserDTO(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole().name()
        );
        
        // Tạo AuthResponse với đầy đủ thông tin
        AuthResponse response = new AuthResponse();
        response.setOk(true);
        response.setMessage("Đăng ký thành công");
        response.setToken(token);
        response.setUser(userDTO);
        
        return response;
    }
}
