#!/bin/bash

set -euo pipefail

# Define variables
BASE_URL="https://download.herdphp.com"
INSTALL_DIR="$HOME/.config/herd-lite/bin"
PHP_BIN="$INSTALL_DIR/php"
COMPOSER_BIN="$INSTALL_DIR/composer"
LARAVEL_BIN="$INSTALL_DIR/laravel"

# Create the directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# Helper functions
show_spinner() {
  local pid=$1
  local delay=0.1
  local spinstr='|/-\'
  local i=0

  while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
    # Get the current character for the spinner
    printf "\b%c" "${spinstr:i++%${#spinstr}:1}"
    sleep $delay
  done

  # Clear the spinner once the process is complete
  printf "\b \b \n"
}


download_with_spinner() {
  local url=$1
  local output_file=$2

  # Start curl in the background, suppressing all output and errors
  curl -L "$url" -o "$output_file" > /dev/null 2>&1 &


  # Capture the PID of curl
  local curl_pid=$!

  # Show the spinner while curl is running
  show_spinner $curl_pid

  # Wait for curl to complete
  wait $curl_pid

  # Check if the download was successful
  if [ $? -eq 0 ]; then
    #success "File downloaded successfully to $output_file."
    chmod +x "$output_file"
  else
    error "Failed to download file from $url."
    exit 1
  fi
}

info() {
    local blue_bg="\033[44m"
    local white_text="\033[97m"
    local reset="\033[0m"
    printf " ${blue_bg}${white_text} INFO ${reset} $1"
}

success() {
    local green_bg="\033[42m"
    local black_text="\033[30m"
    local reset="\033[0m"
    printf " ${green_bg}${black_text} SUCCESS ${reset} $1 \n"
}

error() {
    local red_bg="\033[41m"
    local white_text="\033[97m"
    local reset="\033[0m"
    printf " ${red_bg}${white_text} ERROR ${reset} $1 \n"
}

clear

info "Downloading PHP binary…  "
if [ "$(uname -m)" = "x86_64" ]; then
  download_with_spinner "$BASE_URL/herd-lite/linux/x64/8.5/php" "$PHP_BIN"
else
  download_with_spinner "$BASE_URL/herd-lite/linux/arm64/8.5/php" "$PHP_BIN"
fi

# Download the Composer binary
info "Downloading Composer binary…  "
download_with_spinner "$BASE_URL/herd-lite/composer" "$COMPOSER_BIN"

info "Downloading Laravel Installer…  "
download_with_spinner "$BASE_URL/resources/laravel" "$LARAVEL_BIN"

info "Downloading cacert.pem…  "
download_with_spinner "https://curl.se/ca/cacert.pem" "$INSTALL_DIR/cacert.pem"

if [ ! -f "$INSTALL_DIR/php.ini" ]; then
  touch "$INSTALL_DIR/php.ini"

  echo "curl.cainfo=$INSTALL_DIR/cacert.pem" >> "$INSTALL_DIR/php.ini"
  echo "openssl.cafile=$INSTALL_DIR/cacert.pem" >> "$INSTALL_DIR/php.ini"
  echo "pcre.jit=0" >> "$INSTALL_DIR/php.ini"
fi

# Detect the current shell
CURRENT_SHELL=$(basename "$SHELL")

# Determine profile files to update
PROFILE_FILES=()

case "$CURRENT_SHELL" in
  bash)
    PROFILE_FILES=("$HOME/.bashrc" "$HOME/.bash_profile" "$HOME/.profile")
    ;;
  zsh)
    PROFILE_FILES=("$HOME/.zshrc" "$HOME/.zprofile" "$HOME/.profile")
    ;;
  *)
    PROFILE_FILES=("$HOME/.profile")
    error "Unknown shell. Defaulting to update ~/.profile."
    ;;
esac

# Add the installation directory to the PATH if not already present
PATH_UPDATED=false
if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
  info "Adding $INSTALL_DIR to your PATH... \n"
  for PROFILE_FILE in "${PROFILE_FILES[@]}"; do
    if [[ -f "$PROFILE_FILE" ]]; then
      if ! grep -q "$INSTALL_DIR" "$PROFILE_FILE"; then
        echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$PROFILE_FILE"
        echo "export PHP_INI_SCAN_DIR=\"$INSTALL_DIR:\$PHP_INI_SCAN_DIR\"" >> "$PROFILE_FILE"
        info "Added $INSTALL_DIR to PATH in $PROFILE_FILE \n"
        PATH_UPDATED=true
        break
      fi
    fi
  done

  if [ "$PATH_UPDATED" = false ]; then
    error "Could not automatically update your PATH. Please add the following line to your shell profile:"
    error "export PATH=\"$INSTALL_DIR:\$PATH\""
  fi
else
  info "$INSTALL_DIR is already in your PATH. \n"
fi

# Create uninstall script if it doesn't exist
if [ ! -f "$INSTALL_DIR/uninstall_herd_lite" ]; then
  cat > "$INSTALL_DIR/uninstall_herd_lite" <<EOF
#!/bin/bash

INSTALL_DIR="$INSTALL_DIR"

# Remove the installation directory
rm -rf "\$INSTALL_DIR"

echo "PHP has been uninstalled."
EOF

  chmod +x "$INSTALL_DIR/uninstall_herd_lite"
fi

PHP_VERSION=$("$PHP_BIN" -v | head -n 1 | cut -d ' ' -f 2)

# Example usage
printf "\n"

printf " \033[42m\e[1m\033[30mSuccess!\e[0m\033[0m\n"
printf " \e[1mphp\e[0m, \e[1mcomposer\e[0m, and \e[1mlaravel\e[0m have been installed successfully.\n"

if [ "$PATH_UPDATED" = true ]; then
  printf " Please restart your terminal or run \e[1m'source $PROFILE_FILE'\e[0m to update your PATH.\n"
fi

printf " \n"
printf " 💡 Pro tip: While php.new gives you the basics, \e[1mLaravel Herd\e[0m provides:\n\n"
printf " • One-click PHP version switching and updates (7.4 → 8.5)\n"
printf " • Automatic HTTPS for all sites\n"
printf " • No more localhost:8000 - access your projects at \e[3mfolder-name.test\e[0m\n"
printf " • ...and much more\n"
printf "\n"
printf " Upgrade your workflow → \033[4mhttps://herd.laravel.com\033[0m\n"
printf "\n"