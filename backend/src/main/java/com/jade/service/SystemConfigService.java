package com.jade.service;

import java.util.Map;

public interface SystemConfigService {
    Map<String, String> getAllConfigs();
    void updateConfigs(Map<String, String> configs);
    String getConfig(String key);
}
