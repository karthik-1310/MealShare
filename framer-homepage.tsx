import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FramerHomepage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[120%] h-[120%] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/30 blur-3xl opacity-50"></div>
      </div>

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-12">
          <Link href="#" className="flex items-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path d="M12 0L24 12L12 24L0 12L12 0Z" fill="currentColor" />
              <path d="M12 3L21 12L12 21L3 12L12 3Z" fill="black" />
            </svg>
            <span className="ml-2 font-semibold">Framer</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
              Start
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
              Resources
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
              Help
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
              Enterprise
            </Link>
            <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#" className="text-sm text-gray-300 hover:text-white transition-colors">
            Login
          </Link>
          <Button className="bg-white text-black hover:bg-gray-200 rounded-full text-sm px-4 py-2">Sign up</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-16 pb-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl">
          Just publish it
          <br />
          with Framer
        </h1>
        <p className="mt-6 text-xl text-gray-300">The website builder loved by designers.</p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Button className="bg-white text-black hover:bg-gray-200 rounded-full px-6 py-2">Start for free</Button>
          <Button
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800 rounded-full px-6 py-2 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Watch video
          </Button>
        </div>

        {/* Editor Preview */}
        <div className="relative mt-12 w-full max-w-5xl">
          <div className="relative rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
            {/* Editor Top Bar */}
            <div className="bg-[#111111] p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded hover:bg-gray-800">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white"
                  >
                    <path d="M12 3L21 12L12 21L3 12L12 3Z" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-800">
                      <div className="w-4 h-4 border border-gray-500 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs">
                    <Image
                      src="/placeholder.svg?height=24&width=24"
                      width={24}
                      height={24}
                      alt="User"
                      className="rounded-full"
                    />
                  </div>
                </div>
                {["globe", "settings", "chart", "play"].map((icon, i) => (
                  <div key={i} className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-800">
                    <div className="w-4 h-4 border border-gray-500 rounded-full"></div>
                  </div>
                ))}
                <Button className="bg-blue-500 hover:bg-blue-600 text-white text-xs rounded px-3 py-1">Publish</Button>
              </div>
            </div>

            {/* Editor Main Area */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-48 bg-[#111111] border-r border-gray-800">
                <div className="flex border-b border-gray-800">
                  <div className="flex-1 py-2 px-4 text-center text-xs text-gray-400 hover:bg-gray-800">Pages</div>
                  <div className="flex-1 py-2 px-4 text-center text-xs bg-gray-800 text-white">Layers</div>
                  <div className="flex-1 py-2 px-4 text-center text-xs text-gray-400 hover:bg-gray-800">Assets</div>
                </div>
                <div className="p-2">
                  <div className="flex items-center gap-2 p-2 rounded bg-gray-800/50 mb-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="text-gray-400"
                    >
                      <path
                        d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-xs">Home</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-1 text-xs text-blue-400 mb-1">
                      <span>—</span>
                      <span>Desktop</span>
                    </div>
                    <div className="ml-4 bg-blue-500 rounded text-xs p-2 mb-1">Header</div>
                    <div className="ml-4 flex items-center gap-1 text-xs text-gray-400 pl-2 py-1">
                      <span>T</span>
                      <span>Header</span>
                    </div>
                    <div className="ml-4 flex items-center gap-1 text-xs text-gray-400 pl-2 py-1">
                      <span>T</span>
                      <span>Paragraph</span>
                    </div>
                    <div className="ml-4 flex items-center gap-1 text-xs text-gray-400 pl-2 py-1">
                      <span>□</span>
                      <span>Image</span>
                    </div>
                    <div className="ml-4 flex items-center gap-1 text-xs text-gray-400 pl-2 py-1">
                      <span>□</span>
                      <span>Body</span>
                    </div>
                    <div className="ml-4 flex items-center gap-1 text-xs text-gray-400 pl-2 py-1">
                      <span>□</span>
                      <span>Updates</span>
                    </div>
                    <div className="ml-4 flex items-center gap-1 text-xs text-gray-400 pl-2 py-1">
                      <span>□</span>
                      <span>Logo Strip</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Area */}
              <div className="flex-1 bg-[#111111] min-h-[400px]">
                <div className="p-2 flex items-center justify-between border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-blue-500 rounded px-2 py-1 text-xs">
                      <span>Desktop</span>
                      <span>·</span>
                      <span>1200</span>
                    </div>
                  </div>
                  <div className="text-xs text-blue-400">Breakpoint</div>
                </div>
                <div className="p-4 flex justify-center">
                  <div className="w-full max-w-md h-[300px] rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Properties Panel */}
              <div className="w-56 bg-[#111111] border-l border-gray-800">
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">Position</div>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1 bg-gray-800 rounded text-center text-xs py-1">Type</div>
                      <div className="flex-1 bg-gray-700 rounded text-center text-xs py-1">Relative</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-400">Size</div>
                      <div className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-800">+</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-xs text-gray-400">Width</div>
                      <div className="flex">
                        <div className="flex-1 bg-gray-800 rounded-l text-center text-xs py-1">1fr</div>
                        <div className="w-8 bg-gray-700 rounded-r text-center text-xs py-1">▼</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-xs text-gray-400">Height</div>
                      <div className="flex">
                        <div className="flex-1 bg-gray-800 rounded-l text-center text-xs py-1">Auto</div>
                        <div className="w-8 bg-gray-700 rounded-r text-center text-xs py-1">▼</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="text-xs text-gray-400">Max Width</div>
                      <div className="flex">
                        <div className="flex-1 bg-gray-800 rounded-l text-center text-xs py-1">1200</div>
                        <div className="w-8 bg-gray-700 rounded-r text-center text-xs py-1">▼</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Layout</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Feature Tag */}
          <div className="absolute top-0 left-8 -translate-y-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
            <span>+</span>
            <span>New: March Font Drop</span>
          </div>
        </div>
      </main>

      {/* Cookie Consent */}
      <div className="fixed bottom-4 left-4 z-50 bg-white text-black p-4 rounded-lg shadow-lg max-w-xs flex flex-col gap-2">
        <p className="text-sm">We use cookies to personalize content, run ads, and analyze traffic.</p>
        <Button className="bg-gray-200 hover:bg-gray-300 text-black w-full">Okay</Button>
      </div>
    </div>
  )
}

