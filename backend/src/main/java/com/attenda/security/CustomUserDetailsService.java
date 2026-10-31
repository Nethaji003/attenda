package com.attenda.security;

import com.attenda.model.User;
import com.attenda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final com.attenda.repository.StudentRepository studentRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return new org.springframework.security.core.userdetails.User(
                    user.getUsername(),
                    user.getPassword(),
                    user.getActive(),
                    true, true, true,
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            );
        }

        var studentOpt = studentRepository.findByStudentId(username);
        if (studentOpt.isPresent()) {
            com.attenda.model.Student s = studentOpt.get();
            return new org.springframework.security.core.userdetails.User(
                    s.getStudentId(),
                    "",
                    s.getActive() != null ? s.getActive() : true,
                    true, true, true,
                    List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))
            );
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}
