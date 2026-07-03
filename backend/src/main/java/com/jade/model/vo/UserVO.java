package com.jade.model.vo;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/** 用户视图对象 */
@Data
public class UserVO {
    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private String email;
    private String phone;
    private Integer status;
    private List<String> roles;
    private LocalDateTime createTime;
}
