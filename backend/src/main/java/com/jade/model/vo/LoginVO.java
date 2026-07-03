package com.jade.model.vo;

import lombok.Data;

/** 登录返回 */
@Data
public class LoginVO {
    private String accessToken;
    private String refreshToken;
    private UserVO user;
}
