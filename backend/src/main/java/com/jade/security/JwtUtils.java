package com.jade.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** JWT工具类 */
@Component
public class JwtUtils {

    @Value("${jwt.secret:defaultSecretKeyThatShouldBeChangedInProduction!!}")
    private String secret;

    @Value("${jwt.access-expire:7200}")
    private long accessExpire; // 默认2小时

    @Value("${jwt.refresh-expire:604800}")
    private long refreshExpire; // 默认7天

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** 生成访问令牌 */
    public String generateAccessToken(Long userId, String username, List<String> roles) {
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessExpire * 1000))
                .signWith(getKey())
                .compact();
    }

    /** 生成刷新令牌 */
    public String generateRefreshToken(Long userId, String username) {
        return Jwts.builder()
                .subject(username)
                .claim("userId", userId)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshExpire * 1000))
                .signWith(getKey())
                .compact();
    }

    /** 解析令牌 */
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Long getUserId(String token) {
        return parseToken(token).get("userId", Long.class);
    }

    public String getUsername(String token) {
        return parseToken(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        return parseToken(token).get("roles", List.class);
    }

    /** 验证令牌 */
    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
