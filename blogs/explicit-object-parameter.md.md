
<br>
<br>

<div style="width:960px; height:540px">

<div style="width:720px; height:540px margin:0px 120px;">

# C++23 推导`this`：
<div style="color:orange; font-size: 56pt; font-weight: 500;margin-bottom:20px">
显式对象形参
</div>

```cpp
[](this auto&& self) -> void { self(); } ();
```
</div>

</div>

<br>

### C++23

- 个人博客：blog.juvw.xyz
- QQ频道：`std::forward`编程社区
***

## 复习：隐式对象形参

- 成员函数的参数列表前方有一个隐式对象形参
- `this`指针指向这个隐式对象形参
- 函数的cv限定和引用限定会影响隐式对象形参的类型
- 静态成员函数在语法上也有隐式对象形参，但传参时此参数被忽略
***

## 显式对象形参
-  使用`this`关键字指示显式对象形参
-  调用形式和普通成员函数一样
```cpp
struct A {
    void foo(this A& self) {}
};
int main() {
    A a; a.foo();
}
```

***


- <strong>构造函数</strong>、<strong>析构函数</strong>、<strong>静态成员函数</strong>、<strong>虚函数</strong>不能有显式对象形参
```cpp
struct A {
    // Error, 构造函数不能有显式对象形参
    A(this const A&);
    // Error, 析构函数不能有显式对象形参
    ~A(this const A&);
    // Error, 静态成员函数不能有显式对象形参
    static void foo(this const A&);
    // Error, 虚函数不能有显式对象形参
    virtual void foo(this const A&);
};
```

***
- 显式对象成员函数不能拥有CV限定和引用限定
- 但其显式对象形参可以拥有CV限定和引用限定
```cpp
struct A {
    void foo(this const A&);
    // 相当于 void foo() const&
}
```
***
- 显式对象成员函数体内不能使用`this`指针
- 成员访问必须通过显式对象形参进行
```cpp
struct A {
    void bar() const {}
    void foo(this const A& self) {
        self.bar();  // OK, 通过显式对象形参进行成员访问
        this->bar(); // Error, 不能使用this
        bar();       // Error, 没有隐式this->
    }
};
```
***

- 显式对象成员函数与隐式对象成员函数可以重载
- 只要重载决议能够区分二者的参数类型
```cpp
struct A {
    void foo(this A& a);
    // OK, 隐式对象形参的类型是 const A&
    void foo() const&;
    // OK, 隐式对象形参的类型是 A&&
    void foo() &&;
    // Error, 隐式对象形参的类型是 A&，与第一个重载冲突
    void foo() &;
};
```

***

- 显式对象形参的传参规则与普通的函数参数一样
- 显式对象形参的类型不必与该类相同
```cpp
struct A {};
struct B {
    // 自定义转换到A
    operator A() const { return {}; }
    // 传参时发生复制
    void foo (this B b) {}
    // OK, 传参时先转换到A
    void bar(this A a) {}
};
```
***
- 显式对象形参也可以用在函数模板中
- 推导`this`：同样适用模板实参推导
```cpp
struct A {
    template<class T>
    void foo(this T&& self) { }
};
int main() {
    A a; const A& r = a;
    a.foo();            // T -> A&
    r.foo();            // T -> const A&
    std::move(a).foo(); // T -> A&&
}
```
***
- 指向显式对象成员函数的指针是普通函数指针
```cpp
struct A {
    void bar(int) {}
    void foo(this A, int) {}
};
int main() {
  A a;
  // p1的类型是 void(A::*)(int)
  auto p1 = &A::bar;   (a.*p1)(0);
  // p2的类型是 void(*)(A, int)
  auto p2 = &A::foo;   p2(a, 0);
}
```
***
## 使用例
- 减少重复成员函数的编码
```cpp
struct A {
    int* m_data;
    A() : m_data(new int[5]) {}
    ~A() { delete[] m_data; }

    // 有显式对象形参之前，const与非const重载必须写两遍，虽然它们的函数体几乎一模一样
    // int& operator[](size_t i) & {
    //   return m_data[i];
    // }

    // const int& operator[](size_t i) const& {
    //   return m_data[i];
    // }

    // 如果需要进一步区分左值实参和右值实参，甚至还要写第三个重载
    // int&& operator[](size_t i) && {
    //   return m_data[i];
    // }

    // 使用显式对象形参，可自动推导实参类型，配合std::forward_like
    // 和decltype(auto)可自动推导返回值的引用限定和cv限定
    decltype(auto) operator[](this auto&& self, size_t i) {
        return std::forward_like<decltype(self)>(self.m_data[i]);
    }
};
```
***

- 简化CRTP（奇异递归模板模式，Curiously recurring template pattern）
```cpp
struct inc_op {
    decltype(auto) operator++(this auto&& self) {
        return self.post_inc();
    }
    auto operator++(this auto&& self, int) {
        auto temp = self;
        ++self;
        return temp;
    }
};

struct A : inc_op  {
    int value;
    A& post_inc() { value++; return *this; }
};
```

***

- 简化递归lambda
```cpp
#include <iostream>
int main() {
    // lambda虽然是类类型，却无法在其成员函数内通过this
    // 访问隐式对象形参，递归lambda必须传一个额外的参数
    // 这样既不直观，也很低效。
    auto fib1 = [](auto&& self, int n) {
        if(n <= 1)
            return n;
        else
            return self(self, n-1)+self(self, n-2);
    };
    std::cout << fib1(fib1, 8) << '\n';

    // 使用显式对象形参可以方便又直观地递归
    auto fib2 = [](this auto&& self, int n) {
        if(n <= 1)
            return n;
        else
            return self(n-1)+self(n-2);
    };
    std::cout << fib2(8) << '\n';
}
```
***
# 显式对象形参
### C++23

- 个人博客：blog.juvw.xyz
- QQ频道：`std::forward`编程社区