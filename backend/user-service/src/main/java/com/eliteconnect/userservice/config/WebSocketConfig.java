package com.eliteconnect.userservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // ✅ Clients subscribe to topics (server → client)
        config.enableSimpleBroker("/topic", "/queue");

        // ✅ Prefix for messages bound for @MessageMapping (client → server)
        config.setApplicationDestinationPrefixes("/app");

        // ✅ Optional: let users send direct messages to each other
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // ✅ WebSocket endpoint frontend connects to (ws://host:port/ws)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // allow CORS for testing, restrict later
                .withSockJS();                  // fallback for browsers that don’t support WebSocket
    }
}
