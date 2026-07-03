package com.jade.model.dto;

import lombok.Data;

/** 用户DTO */
@Data
public class UserDTO {
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private String avatar;
    private Integer status;
}
