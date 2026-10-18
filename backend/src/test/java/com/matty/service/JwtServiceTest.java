package com.matty.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", "MTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNA==");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 604800000L);
    }

    @Test
    void testTokenSubjectAndClaims() {
        String token = jwtService.generateToken("user123", "test@example.com", "USER");
        assertNotNull(token);
        assertEquals("user123", jwtService.extractUserId(token));
        assertEquals("USER", jwtService.extractRole(token));
        assertTrue(jwtService.isTokenValid(token));
    }
}
