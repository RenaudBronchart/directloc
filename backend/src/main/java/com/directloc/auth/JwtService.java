// src/main/java/com/directloc/auth/JwtService.java
package com.directloc.auth;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

/**
 * JWT utilities:
 * - Generate tokens with subject (email) and expiration configured via properties.
 * - Extract claims (subject, expiration, etc).
 * - Validate signature & expiration.
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;      // HMAC secret (keep long & random)

    @Value("${jwt.expiration}")
    private long jwtExpiration;    // millis (e.g. 86400000 = 24h)

    private Key getSigningKey() {
        // HS256 signing key derived from configured secret
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /** Build and sign a JWT for the given username (email). */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date(System.currentTimeMillis()))      // iat
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration)) // exp
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /** Read "sub" (subject) from token. */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Generic claim extraction helper. */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claimsResolver.apply(claims);
    }

    /** Validate: subject matches and token not expired. */
    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(username) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
