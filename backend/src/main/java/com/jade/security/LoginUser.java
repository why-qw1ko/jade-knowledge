package com.jade.security;

import com.jade.model.entity.User;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.*;
import java.util.stream.Collectors;

/** 登录用户信息 */
@Data
public class LoginUser implements UserDetails {
    private Long userId;
    private String username;
    private String password;
    private List<String> roles;
    private List<String> permissions;

    public LoginUser(User user, List<String> roles, List<String> permissions) {
        this.userId = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.roles = roles;
        this.permissions = permissions;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        if (roles != null) {
            roles.forEach(r -> authorities.add(new SimpleGrantedAuthority("ROLE_" + r)));
        }
        return authorities;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
