# Using a specific version to ensure compatibility
FROM node:22.13.0

# Copying everything at once, assuming all necessary files are in the context
COPY . /home/client

# Setting the working directory to where you copied your app
WORKDIR /home/client

# Setting the environment variable for the port, as you've done
ENV PORT=5173

# It's not necessary to update or upgrade the container in most build processes.
# This can lead to larger image sizes and longer build times. Typically, you trust the base image to be up to date.

# Removing node_modules and yarn.lock to ensure that dependencies are cleanly installed
RUN rm -rf node_modules yarn.lock

# Install dependencies
RUN npm install

# You had a --host option in your original CMD which is not correct because `serve` does not accept a --host flag directly in its command line
# Also, CMD should not be used to pass flags to an entrypoint unless in JSON format, which is not intended here.
CMD ["npm","run", "build"]
