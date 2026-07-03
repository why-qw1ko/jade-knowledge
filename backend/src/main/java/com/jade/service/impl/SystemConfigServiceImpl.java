package com.jade.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jade.mapper.SystemConfigMapper;
import com.jade.model.entity.SystemConfig;
import com.jade.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigMapper configMapper;

    @Override
    public Map<String, String> getAllConfigs() {
        List<SystemConfig> configs = configMapper.selectList(null);
        Map<String, String> map = new HashMap<>();
        for (SystemConfig c : configs) {
            map.put(c.getConfigKey(), c.getConfigValue());
        }
        return map;
    }

    @Override
    public void updateConfigs(Map<String, String> configs) {
        for (Map.Entry<String, String> entry : configs.entrySet()) {
            SystemConfig existing = configMapper.selectOne(
                    new LambdaQueryWrapper<SystemConfig>().eq(SystemConfig::getConfigKey, entry.getKey()));
            if (existing != null) {
                existing.setConfigValue(entry.getValue());
                configMapper.updateById(existing);
            } else {
                SystemConfig config = new SystemConfig();
                config.setConfigKey(entry.getKey());
                config.setConfigValue(entry.getValue());
                configMapper.insert(config);
            }
        }
    }

    @Override
    public String getConfig(String key) {
        SystemConfig config = configMapper.selectOne(
                new LambdaQueryWrapper<SystemConfig>().eq(SystemConfig::getConfigKey, key));
        return config != null ? config.getConfigValue() : null;
    }
}
