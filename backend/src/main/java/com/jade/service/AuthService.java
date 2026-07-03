package com.jade.service;

import com.jade.model.dto.LoginRequest;
import com.jade.model.dto.RegisterRequest;
import com.jade.model.vo.LoginVO;

public interface AuthService {
    LoginVO login(LoginRequest request);
    void register(RegisterRequest request);
    LoginVO refreshToken(String refreshToken);
}
