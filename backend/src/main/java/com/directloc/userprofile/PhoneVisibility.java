// com/directloc/userprofile/PhoneVisibility.java
package com.directloc.userprofile;

public enum PhoneVisibility {
    NEVER,        // never reveal phone
    AFTER_ACCEPT, // reveal only when a booking is ACCEPTED
    ALWAYS_FOR_HOSTS // reveal if user is host and decides to show it (tú decides la lógica exacta)
}
