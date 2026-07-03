package com.jade.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/** 安全工具类 */
public class SecurityUtils {

    public static Long getCurrentUserId() {
        LoginUser user = getCurrentLoginUser();
        return user != null ? user.getUserId() : null;
    }

    public static String getCurrentUsername() {
        LoginUser user = getCurrentLoginUser();
        return user != null ? user.getUsername() : null;
    }

    public static LoginUser getCurrentLoginUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof LoginUser) {
            return (LoginUser) auth.getPrincipal();
        }
        return null;
    }
}
