package com.gucarsoft.socketbe.model;

import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import java.sql.Timestamp;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class Message {

    private String message;
    private String username;

    @CreationTimestamp
    private Timestamp created;

    @Enumerated(EnumType.STRING)
    private MessageType messageType;

}
