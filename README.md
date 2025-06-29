## How to compile pdfium to wasm

You will need depot_tools and emsdk

```
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
export PATH="$PATH:/path/to/depot_tools"
```

### Create `.gclient` file

```
solutions = [
  { "name"        : 'pdfium',
    "url"         : 'https://pdfium.googlesource.com/pdfium.git',
    "deps_file"   : 'DEPS',
    "managed"     : False,
    "custom_deps" : {
    },
    "custom_vars": {'checkout_configuration': 'minimal'},
  },
]
target_os = [ 'emscripten' ]
```

### Clone the pdfium source

I will use 6815 version here, if you use other version, you might need to patch it slightly different.

```
gclient sync -r origin/chromium/6815 --no-history --shallow
```

### Install emsdk

```
cd pdfium/third_party
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

### Patch sources (Most Difficult Part)

#### pdfium/BUILD.gn

We need to disable `skia`. Find and comment out/remove this line:

```
deps += [ "//skia" ]
```

#### pdfium/build/config/BUILDCONFIG.gn

Find and add the target_os support.

```
else if (target_os == "emscripten") {
  _default_toolchain = "//build/toolchain/wasm:$target_cpu"
} else {
  assert(false, "Unsupported target_os: $target_os")
}
```

### pdfium/build/toolchain/wasm

At `6815` version, we don't have this built-in wasm toolchain, so we need to add one. 

```
mkdir pdfium/build/toolchain/wasm
touch BUILD.gn
```

The `BUILD.gn` content is:

```
import("//build/toolchain/gcc_toolchain.gni")

gcc_toolchain("emscripten") {
  cc = "emcc"
  cxx = "em++"

  readelf = "llvm-readobj"
  ar = "emar"
  ld = cxx
  nm = "emnm"

  extra_cflags = "-fno-stack-protector -Wno-unknown-warning-option -D_POSIX_C_SOURCE=200112"
  extra_cxxflags = "-fno-stack-protector -Wno-unknown-warning-option -D_POSIX_C_SOURCE=200112"

  toolchain_args = {
    current_cpu = "wasm"
    current_os = "emscripten"
  }
}
```

### Generate build config

```
gn gen out/prod
touch out/prod/args.gn
```

The content of `args.gn` is:

```
is_debug = false
treat_warnings_as_errors = false
pdf_use_skia = false
pdf_enable_xfa = false
pdf_enable_v8 = false
is_component_build = false
clang_use_chrome_plugins = false
pdf_is_standalone = true
use_debug_fission = false
use_custom_libcxx = false
use_sysroot = false
pdf_is_complete_lib = true
pdf_use_partition_alloc = false
is_clang = false
symbol_level = 0
target_os="emscripten"
target_cpu="wasm"
```

### Compile

```sh
ninja -C out/prod pdfium -v
```

### Compile wasm

```sh
em++ ./pdfium/out/prod/obj/libpdfium.a \
  -g \
  -v \
  -sEXPORT_ES6=1 \
  -sENVIRONMENT=worker \
  -sMODULARIZE=1 \
  -sWASM=1 \
  -sALLOW_MEMORY_GROWTH=1 \
  -sEXPORT_NAME=createPdfium \
  -sUSE_ZLIB=1 \
  -sUSE_LIBJPEG=1 \
  -sASSERTIONS=1 \
  -sEXPORTED_RUNTIME_METHODS=ccall \
  -sEXPORTED_FUNCTIONS=_malloc,_free \
  -lpdfium \
  -L./pdfium/out/prod/obj \
  -I./pdfium/public \
  -std=c++11 \
  -Wall \
  --no-entry \
  -o \
  ./pdfium.js

```