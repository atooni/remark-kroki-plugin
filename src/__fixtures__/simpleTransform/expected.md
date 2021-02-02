
## Sample image

Some Text

```lang=kroki imgType=mermaid
graph TD
  subgraph Shop X
    Bx(Shop X) --> FX1((Fs X1)) --> Bx
    Bx --> FX2((Fs X2)) --> Bx
  end
  subgraph Shop Y
    By(Shop Y) --> FY1((Fs Y1)) --> By
    By --> FY2((Fs Y2)) --> By
  end
  subgraph Shop Z
    Bz(Shop Z) --> FZ1((Fs Z1)) --> Bz
    Bz --> FZ2((Fs Z2)) --> Bz
  end
  A(Data Center) --> Bx --> A
  A --> By --> A
  A --> Bz --> A
```

## More text

Something interesting to say ....
